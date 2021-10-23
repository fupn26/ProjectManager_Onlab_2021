using MongoDAL.Context;
using MongoDAL.Repositories;
using CommentAPI.Models;

namespace CommentAPI.Repositories
{
    public class CommentRepository : BaseRepository<Comment>, ICommentRepository
    {
        public CommentRepository(IDbContext context) : base(context)
        {
        }
    }
}
