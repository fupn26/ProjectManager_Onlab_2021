using MongoDB.Bson;
using MongoDB.Driver;
using ProjectAPI.Models;
using ProjectAPI.Models.DbContext;
using ProjectAPI.Repositories.Base;
using System.Threading.Tasks;

namespace ProjectAPI.Repositories
{
    public class ProjectRepository : BaseRepository<Project>, IProjectRepository
    {
        private readonly string _indexName = "Title_Owner_Unique";

        public ProjectRepository(IProjectDbContext context) : base(context)
        {
            var indexKeyDefinitions = Builders<Project>.IndexKeys.Ascending("Title").Ascending("Owner");
            var createIndexOptions = new CreateIndexOptions()
            {
                Name = _indexName, 
                Unique = true
            };
            _collection.Indexes.CreateOne(new CreateIndexModel<Project>(indexKeyDefinitions, createIndexOptions));
        }
    }
}
