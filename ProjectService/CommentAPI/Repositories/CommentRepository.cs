using MongoDAL.Context;
using MongoDAL.Repositories;
using CommentAPI.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using MongoDB.Driver;

namespace CommentAPI.Repositories
{
    public class CommentRepository : BaseRepository<Comment>, ICommentRepository
    {
        public CommentRepository(IDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Comment>> GetCommentByToDoId(string projectId)
        {
            var filter = Builders<Comment>.Filter.Eq(comment => comment.ToDoId, projectId);
            var comments = await _collection.FindAsync(filter);
            return await comments.ToListAsync();
        }
    }
}
