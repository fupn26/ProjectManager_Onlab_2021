using MongoDAL.Context;
using ProjectAPI.Models;
using MongoDAL.Repositories;

namespace ProjectAPI.Repositories
{
    public class CommentRepository : BaseRepository<Comment>, ICommentRepository
    {
        public CommentRepository(IDbContext context) : base(context)
        {
        }
    }
}
