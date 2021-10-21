using MongoDB.Driver;
using MongoDAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MongoDAL.Repositories
{
    public interface IBaseRepository<TEntity> where TEntity : IEntity
    {
        Task Create(TEntity objectToCreate);
        Task<ReplaceOneResult> Update(TEntity objToUpdate);
        Task<DeleteResult> Delete(string id);
        Task<TEntity> Get(string id);
        Task<IEnumerable<TEntity>> Get();
    }
}
