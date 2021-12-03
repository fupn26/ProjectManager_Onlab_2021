using MongoDAL.Repositories;
using MongoDAL.Context;
using ToDoAPI.Models;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;

namespace ToDoAPI.Repositories
{
    public class ToDoRepository : BaseRepository<ToDo>, IToDoRepository
    {
        public ToDoRepository(IDbContext context) : base(context)
        {
        }
        public async Task<IEnumerable<ToDo>> GetByProjectId(string id)
        {
            var objectId = new ObjectId(id);

            FilterDefinition<ToDo> filter = Builders<ToDo>.Filter.Eq(nameof(ToDo.ProjectId), objectId);

            var resultList = await _collection.FindAsync(filter);

            return await resultList.ToListAsync();
        }
    }
}
