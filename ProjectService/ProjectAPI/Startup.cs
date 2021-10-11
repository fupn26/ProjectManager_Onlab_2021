using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using ProjectAPI.Models.DbContext;
using ProjectAPI.Models.DbSettings;
using ProjectAPI.Repositories;
using ProjectAPI.Services;

namespace ProjectAPI
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<ProjectDbSettings>(
                Configuration.GetSection(nameof(ProjectDbSettings)));
            services.AddSingleton<IProjectDbSettings>(sp =>
                sp.GetRequiredService<IOptions<ProjectDbSettings>>().Value);

            services.Configure<ProjectCollectionSettings>(
                Configuration.GetSection(nameof(ProjectCollectionSettings))
            );
            services.Configure<TaskCollectionSettings>(
                Configuration.GetSection(nameof(TaskCollectionSettings))
            );
            services.Configure<CommentCollectionSettings>(
                Configuration.GetSection(nameof(CommentCollectionSettings))
            );

            services.AddSingleton<IProjectDbContext, ProjectDbContext>();
            services.AddSingleton<ICommentRepository, CommentRepository>();
            services.AddSingleton<ITodoRepository, ToDoRepository>();
            services.AddSingleton<IProjectRepository, ProjectRepository>();
            // services.AddSingleton<IProjectService, ProjectService>();

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

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
