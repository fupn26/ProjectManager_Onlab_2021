using ProjectAPI.Models;
using MongoDAL.Repositories;
using MongoDAL.Context;

namespace ProjectAPI.Repositories
{
    public class ToDoRepository : BaseRepository<ToDo>, ITodoRepository
    {
        public ToDoRepository(IDbContext context) : base(context)
        {
        }
    }
}
