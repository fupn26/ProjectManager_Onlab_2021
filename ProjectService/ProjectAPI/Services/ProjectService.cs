using ProjectAPI.Models;
using ProjectAPI.Repositories;

namespace ProjectAPI.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _repository;

        public ProjectService(IProjectRepository repository)
        {
            _repository = repository;
        }

        public void Create(Project projectToCreate)
        {
            throw new System.NotImplementedException();
        }

        public Project Get(string projectId)
        {
            throw new System.NotImplementedException();
        }
    }
}
