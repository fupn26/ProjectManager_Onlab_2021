using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAPI.Controllers.DTO
{
    public class CommentCreateDto
    {
        [Required]
        public string ToDoId { get; set; }
        [Required]
        public string Content { get; set; }
    }
}
