using MongoDB.Driver;
using MongoDAL.Settings;
using Microsoft.Extensions.Options;
using OpenTracing.Contrib.MongoDB;
// In case we want to use OpenTelemetry
//using MongoDB.Driver.Core.Extensions.DiagnosticSources;

namespace MongoDAL.Context
{
    public class DbContext : IDbContext
    {
        private readonly IMongoDatabase _db;
        private readonly MongoClient _client;

        public DbContext(IOptions<DbSettings> settings)
        {
            var clientSettings = MongoClientSettings.FromConnectionString(settings.Value.ConnectionString);
            clientSettings.ClusterConfigurator = cb => cb.Subscribe(new DiagnosticsActivityEventSubscriber());
            _client = new MongoClient(clientSettings);
            _db = _client.GetDatabase(settings.Value.DatabaseName);
        }

        public IMongoCollection<T> GetCollection<T>(string name)
        {
            if (name == null)
            {
                return null;
            }

            return _db.GetCollection<T>(name);
        }
    }
}
