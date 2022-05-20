using Microsoft.Extensions.Logging;
using OpenTracing.Util;
using OpenTracing;
using System;
using ProjectAPI.Settings;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class JaegerServiceCollectionExtensions
    {
        // Registers and starts Jaeger.
        // Also registers OpenTracing related services!
        public static IServiceCollection AddJaeger(this IServiceCollection services, JaegerSettings env, string serviceName = null)
        {
            if (services == null)
                throw new ArgumentNullException(nameof(services));

            services.AddSingleton<ITracer>(serviceProvider =>
            {
                // This will be the service service name logged with the spans, displayed by Jaeger UI
                Environment.SetEnvironmentVariable("JAEGER_SERVICE_NAME", "projects");
                Environment.SetEnvironmentVariable("JAEGER_SAMPLER_TYPE", "const");
                Environment.SetEnvironmentVariable("JAEGER_AGENT_HOST", env.Host);
                Environment.SetEnvironmentVariable("JAEGER_AGENT_PORT", $"{env.Port}");

                // We could also create a new factory and configure it for our needs
                ILoggerFactory loggerFactory = serviceProvider.GetRequiredService<ILoggerFactory>();

                Jaeger.Configuration.SenderConfiguration.DefaultSenderResolver =
                    new Jaeger.Senders.SenderResolver(loggerFactory).RegisterSenderFactory<Jaeger.Senders.Thrift.ThriftSenderFactory>();

                // Get Jaeger config from environment
                var config = Jaeger.Configuration.FromEnv(loggerFactory);
                // We could further modify Jaeger config here
                var tracer = config.GetTracer();

                if (!GlobalTracer.IsRegistered())
                    // Allows code that can't use DI to also access the tracer.
                    GlobalTracer.Register(tracer);

                return tracer;
            });

            // Also add Open Tracing related services
            services.AddOpenTracing();

            return services;
        }
    }
}