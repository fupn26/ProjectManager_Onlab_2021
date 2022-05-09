using MongoDB.Driver;
using MongoDAL.Settings;
using Microsoft.Extensions.Options;

namespace MongoDAL.Context
{
    public class DbContext : IDbContext
    {
        private readonly IMongoDatabase _db;
        private readonly MongoClient _client;

        public DbContext(IOptions<DbSettings> settings)
        {
            _client = new MongoClient(settings.Value.ConnectionString);
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
