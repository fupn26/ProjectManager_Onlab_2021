using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using ProjectAPI.Repositories;
using MongoDAL.Settings;
using MongoDAL.Context;
using MassTransit;
using MessagingService.Settings;
using MessagingService;


namespace ProjectAPI
{
    public class Startup
    {
        private const string _nameOfDbSettings = "ProjectDbSettings";
        private const string _nameOfRabbitMqSettings = "RabbitMqSettings";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<DbSettings>(
                Configuration.GetSection(_nameOfDbSettings));

            services.Configure<RabbitMqSettings>(
                Configuration.GetSection(_nameOfRabbitMqSettings));

            services.AddSingleton<IDbContext, DbContext>();
            services.AddSingleton<IProjectRepository, ProjectRepository>();
            services.AddSingleton<IMessagePublisher, MessagingService.MessagePublisher>();

            services.AddControllers();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "ProjectAPI", Version = "v1" });
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
