using MongoDAL.Repositories;
using MongoDAL.Context;
using ToDoAPI.Models;

namespace ToDoAPI.Repositories
{
    public class ToDoRepository : BaseRepository<ToDo>, IToDoRepository
    {
        public ToDoRepository(IDbContext context) : base(context)
        {
        }
    }
}
