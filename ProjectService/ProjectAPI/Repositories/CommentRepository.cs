using ProjectAPI.Models;
using ProjectAPI.Models.DbContext;
using ProjectAPI.Repositories.Base;

namespace ProjectAPI.Repositories
{
    public class CommentRepository : BaseRepository<Comment>, ICommentRepository
    {
        public CommentRepository(IProjectDbContext context) : base(context)
        {
        }
    }
}
