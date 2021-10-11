using MongoDB.Driver;

namespace ProjectAPI.Models.DbContext
{
    public interface IProjectDbContext
    {
        IMongoCollection<T> GetCollection<T>(string name);
    }
}
