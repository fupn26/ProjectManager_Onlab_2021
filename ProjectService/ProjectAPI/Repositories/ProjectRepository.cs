using MongoDAL.Context;
using MongoDAL.Repositories;
using MongoDB.Driver;
using ProjectAPI.Models;

namespace ProjectAPI.Repositories
{
    public class ProjectRepository : BaseRepository<Project>, IProjectRepository
    {
        private readonly string _indexName = "Title_Owner_Unique";

        public ProjectRepository(IDbContext context) : base(context)
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
