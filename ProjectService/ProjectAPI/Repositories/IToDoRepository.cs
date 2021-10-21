using MongoDAL.Repositories;
using ProjectAPI.Models;

namespace ProjectAPI.Repositories
{
    public interface ITodoRepository : IBaseRepository<ToDo>
    {
    }
}
