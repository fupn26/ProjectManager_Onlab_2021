using ProjectAPI.Models;
using MongoDAL.Repositories;

namespace ProjectAPI.Repositories
{
    public interface IProjectRepository : IBaseRepository<Project>
    {
    }
}
