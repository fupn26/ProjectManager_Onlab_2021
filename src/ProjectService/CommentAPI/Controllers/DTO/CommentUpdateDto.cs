using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CommentAPI.Controllers.DTO
{
    public class CommentUpdateDto
    {
        public string CommentId { get; set; }
        public string newContent { get; set; }
    }
}
