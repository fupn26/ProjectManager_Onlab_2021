using MongoDAL.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;
using ToDoAPI.Models;

namespace ToDoAPI.Repositories
{
    public interface IToDoRepository : IBaseRepository<ToDo>
    {
        Task<IEnumerable<ToDo>> GetByProjectId(string id);
    }
}
