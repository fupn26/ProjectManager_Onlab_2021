using MongoDB.Driver;

namespace MongoDAL.Context
{
    public interface IDbContext
    {
        IMongoCollection<T> GetCollection<T>(string name);
    }
}
