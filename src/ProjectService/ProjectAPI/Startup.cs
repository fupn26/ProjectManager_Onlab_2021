using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using ProjectAPI.Repositories;
using MongoDAL.Settings;
using MongoDAL.Context;
using MessagingService.Settings;
using MessagingService;
using Refit;
using ProjectAPI.WebServices;
using System;
using ProjectAPI.Settings;
using Polly;
using System.Net.Http;
using System.Net;
using OpenTelemetry.Trace;
using OpenTelemetry.Resources;


namespace ProjectAPI
{
    public class Startup
    {
        private const string _nameOfDbSettings = "ProjectDbSettings";
        private const string _nameOfRabbitMqSettings = "RabbitMqSettings";
        private const string _nameOfUserServiceSettings = "UserServiceSettings";
        private const string _nameOfJaegerSettings = "JaegerSettings";
        private const string _serviceName = "projects";
        private const string _serviceVersion = "v1";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            AddConfigurations(services);
            AddServices(services);
            AddOpenTelemetry(services);
            AddPolly(services);

            services.AddControllers();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc(_serviceVersion, new OpenApiInfo { Title = "ProjectAPI", Version = _serviceVersion });
            });
            // Alternative for native RabbitMq communication
            //services.AddMassTransit(x =>
            //{
            //    var settings = Configuration.GetSection(_nameOfRabbitMqSettings).Get<RabbitMqSettings>(); // as RabbitMqSettings;
            //    x.UsingRabbitMq((context, cfg) =>
            //    {
            //        cfg.Host(settings.Host, settings.VirtualHost, h =>
            //        {
            //            h.Username(settings.Username);
            //            h.Password(settings.Password);
            //        });
            //    });
            //});
            //services.AddMassTransitHostedService(true);
        }

        private void AddConfigurations(IServiceCollection services)
        {
            services.Configure<DbSettings>(
                Configuration.GetSection(_nameOfDbSettings));

            services.Configure<RabbitMqSettings>(
                Configuration.GetSection(_nameOfRabbitMqSettings));
        }

        private void AddServices(IServiceCollection services)
        {
            services.AddSingleton<IDbContext, DbContext>();
            services.AddSingleton<IProjectRepository, ProjectRepository>();
            services.AddSingleton<IMessagePublisher, MessagingService.MessagePublisher>();
        }

        private void AddOpenTelemetry(IServiceCollection services)
        {
            var jaegerSettings = Configuration.GetSection(_nameOfJaegerSettings).Get<JaegerSettings>();
            services.AddOpenTelemetryTracing((builder) => builder
                            .AddJaegerExporter(o =>
                            {
                                o.AgentHost = jaegerSettings.Host;
                                o.AgentPort = jaegerSettings.Port;
                            })
                            .AddSource(_serviceName)
                            .SetResourceBuilder(ResourceBuilder
                                .CreateDefault()
                                .AddService(serviceName: _serviceName, serviceVersion: _serviceVersion)
                            )
                            .AddAspNetCoreInstrumentation()
                            .AddMongoDBInstrumentation()
                        );
        }

        private void AddPolly(IServiceCollection services)
        {
            var userSettings = Configuration.GetSection(_nameOfUserServiceSettings).Get<UserServiceSettings>();
            bool RetryableStatusCodesPredicate(HttpStatusCode statusCode) =>
                statusCode == HttpStatusCode.BadGateway
                    || statusCode == HttpStatusCode.ServiceUnavailable
                    || statusCode == HttpStatusCode.GatewayTimeout;

            var waitAndRetryPolicy = Policy
                    .Handle<Exception>()
                    .OrResult<HttpResponseMessage>(msg => RetryableStatusCodesPredicate(msg.StatusCode))
                    .WaitAndRetryAsync(3, retryCount => TimeSpan.FromSeconds(Math.Pow(2, retryCount)));

            var circuitBreaker = Policy
                    .Handle<Exception>()
                    .OrResult<HttpResponseMessage>(msg => RetryableStatusCodesPredicate(msg.StatusCode))
                    .CircuitBreakerAsync(4, TimeSpan.FromMinutes(1));

            services.AddRefitClient<IUserApi>()
                .ConfigureHttpClient(c => c.BaseAddress = new Uri(userSettings.BaseUrl))
                .AddPolicyHandler(Policy
                    .WrapAsync(waitAndRetryPolicy, circuitBreaker)
                );
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment() || env.IsEnvironment("DockerDev"))
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "ProjectAPI v1"));
            }

            // FIXME make sure it's working with docker
            // app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
