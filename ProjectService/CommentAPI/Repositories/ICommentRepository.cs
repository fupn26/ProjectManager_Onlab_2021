using MongoDAL.Repositories;
using CommentAPI.Models;

namespace CommentAPI.Repositories
{
    public interface ICommentRepository : IBaseRepository<Comment>
    {
    }
}
