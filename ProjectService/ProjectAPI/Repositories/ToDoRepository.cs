using ProjectAPI.Models;
using ProjectAPI.Models.DbContext;
using ProjectAPI.Repositories.Base;

namespace ProjectAPI.Repositories
{
    public class ToDoRepository : BaseRepository<ToDo>, ITodoRepository
    {
        public ToDoRepository(IProjectDbContext context) : base(context)
        {
        }
    }
}
