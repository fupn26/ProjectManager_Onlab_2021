using MongoDAL.Context;
using MongoDAL.Repositories;
using MongoDB.Driver;
using ProjectAPI.Models;
using System.Threading.Tasks;

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

        public async Task AddMember(string projectId, string memberId)
        {
            var filter = Builders<Project>.Filter.Eq(e => e.Id, projectId);
            var update = Builders<Project>.Update.Push<string>(e => e.Members, memberId);

            await _collection.FindOneAndUpdateAsync(filter, update);
        }

        public async Task DeleteMember(string projectId, string memberId)
        {
            var filter = Builders<Project>.Filter.Eq(e => e.Id, projectId);
            var update = Builders<Project>.Update.Pull<string>(e => e.Members, memberId);

            await _collection.FindOneAndUpdateAsync(filter, update);
        }

        public async Task UpdateTitle(string projectId, string newTitle)
        {
            var filter = Builders<Project>.Filter.Eq(e => e.Id, projectId);
            var update = Builders<Project>.Update.Set<string>(e => e.Title, newTitle);

            await _collection.FindOneAndUpdateAsync(filter, update);
        }
    }
}
