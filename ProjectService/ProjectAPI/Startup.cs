using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using ProjectAPI.Repositories;
using MongoDAL.Settings;
using ProjectAPI.Models.DbSettings;
using MongoDAL.Context;

namespace ProjectAPI
{
    public class Startup
    {
        private const string _nameOfDbSettings = "ProjectDbSettings";

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

            services.Configure<ProjectCollectionSettings>(
                Configuration.GetSection(nameof(ProjectCollectionSettings))
            );
            services.Configure<TaskCollectionSettings>(
                Configuration.GetSection(nameof(TaskCollectionSettings))
            );
            services.Configure<CommentCollectionSettings>(
                Configuration.GetSection(nameof(CommentCollectionSettings))
            );

            services.AddSingleton<IDbContext, DbContext>();
            services.AddSingleton<ICommentRepository, CommentRepository>();
            services.AddSingleton<ITodoRepository, ToDoRepository>();
            services.AddSingleton<IProjectRepository, ProjectRepository>();

            services.AddControllers();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "ProjectAPI", Version = "v1" });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
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
