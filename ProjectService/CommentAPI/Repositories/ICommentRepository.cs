using MongoDAL.Repositories;
using CommentAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CommentAPI.Repositories
{
    public interface ICommentRepository : IBaseRepository<Comment>
    {
        Task<IEnumerable<Comment>> GetCommentByToDoId(string projectId);
    }
}
