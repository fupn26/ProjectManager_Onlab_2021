using MongoDB.Driver;
using ProjectAPI.Models.DbContext;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ServiceStack;
using MongoDB.Bson;

namespace ProjectAPI.Repositories.Base
{
    public abstract class BaseRepository<TEntity> : IBaseRepository<TEntity> where TEntity : class
    {
        protected readonly IMongoCollection<TEntity> _collection;

        protected BaseRepository(IProjectDbContext context)
        {
            _collection = context.GetCollection<TEntity>(typeof(TEntity).Name);
        }

        public async Task Create(TEntity objectToCreate)
        {
            if (objectToCreate == null)
            {
                throw new ArgumentNullException(nameof(objectToCreate));
            }
            await _collection.InsertOneAsync(objectToCreate);
        }

        public async Task<DeleteResult> Delete(string id)
        {
            var objectId = new ObjectId(id);
            return await _collection.DeleteOneAsync(Builders<TEntity>.Filter.Eq("_id", objectId));
        }

        public async Task<TEntity> Get(string id)
        {
            var objectId = new ObjectId(id);

            FilterDefinition<TEntity> filter = Builders<TEntity>.Filter.Eq("_id", objectId);

            var resultList = await _collection.FindAsync(filter);

            return await resultList.FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<TEntity>> Get()
        {
            var entities = await _collection.FindAsync(Builders<TEntity>.Filter.Empty);
            return await entities.ToListAsync();
        }

        public virtual async Task<ReplaceOneResult> Update(TEntity objToUpdate)
        {
            return await _collection.ReplaceOneAsync(Builders<TEntity>.Filter.Eq("_id", objToUpdate.GetId()), objToUpdate);
        }
    }
}
