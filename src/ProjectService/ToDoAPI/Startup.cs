using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using MongoDAL.Settings;
using Microsoft.Extensions.Configuration;
using ToDoAPI.Repositories;
using MongoDAL.Context;
using ToDoAPI.Settings;
using ToDoAPI.Cache;

namespace ToDoAPI
{
    public class Startup
    {
        private const string _nameOfDbSettings = "ToDoDbSettings";
        private const string _nameOfCacheSettings = "ToDoCacheSettings";

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

            var cacheSettings = new CacheSettings();
            Configuration.GetSection(_nameOfCacheSettings).Bind(cacheSettings);

            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = cacheSettings.ConnectionString;
                options.InstanceName = cacheSettings.InstanceName;
            });

            services.AddSingleton<IDbContext, DbContext>();
            services.AddSingleton<IToDoRepository, ToDoRepository>();
            services.AddTransient<IToDoCache, ToDoCache>();

            services.AddControllers().AddNewtonsoftJson();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "ToDoAPI", Version = "v1" });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment() || env.IsEnvironment("DockerDev"))
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "ToDoAPI v1"));
            }

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
