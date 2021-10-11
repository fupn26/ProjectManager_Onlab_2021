using MongoDB.Driver;
using ProjectAPI.Models.DbSettings;
using System;
using System.Diagnostics;

namespace ProjectAPI.Models.DbContext
{
    public class ProjectDbContext : IProjectDbContext
    {
        private readonly IMongoDatabase _db;
        private readonly MongoClient _client;

        public ProjectDbContext(IProjectDbSettings settings)
        {
            Debug.WriteLine(settings.ConnectionString);
            Debug.WriteLine(settings.DatabaseName);

            _client = new MongoClient(settings.ConnectionString);
            _db = _client.GetDatabase(settings.DatabaseName);
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
