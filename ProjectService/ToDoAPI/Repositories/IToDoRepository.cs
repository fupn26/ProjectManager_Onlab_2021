using MongoDAL.Repositories;
using ToDoAPI.Models;

namespace ToDoAPI.Repositories
{
    public interface IToDoRepository : IBaseRepository<ToDo>
    {
    }
}
