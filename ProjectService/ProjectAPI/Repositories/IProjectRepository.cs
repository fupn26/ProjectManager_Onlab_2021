using ProjectAPI.Models;
using MongoDAL.Repositories;
using System.Threading.Tasks;

namespace ProjectAPI.Repositories
{
    public interface IProjectRepository : IBaseRepository<Project>
    {
        Task AddMember(string projectId, string memberId);
        Task DeleteMember(string projectId, string memberId);
        Task UpdateTitle(string projectId, string newTitle);
    }
}
