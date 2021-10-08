using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProjectAPI.Repositories.Base
{
    public interface IBaseRepository<TEntity> where TEntity : class
    {
        Task Create(TEntity objectToCreate);
        Task<ReplaceOneResult> Update(TEntity objToUpdate);
        Task<DeleteResult> Delete(string id);
        Task<TEntity> Get(string id);
        Task<IEnumerable<TEntity>> Get();
    }
}
