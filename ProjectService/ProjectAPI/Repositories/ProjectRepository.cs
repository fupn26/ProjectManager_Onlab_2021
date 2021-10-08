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
        public ProjectRepository(IProjectDbContext context) : base(context)
        {
        }

        public override async Task<ReplaceOneResult> Update(Project objToUpdate)
        {
            var objectId = new ObjectId(objToUpdate.Id);
            return await _collection.ReplaceOneAsync(Builders<Project>.Filter.Eq("_id", objectId), objToUpdate);
        }
    }
}
