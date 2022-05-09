using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ToDoAPI.Controllers.DTO
{
    public class ToDoCreateDto
    {
        [Required]
        public string ProjectId { get; set; }
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
        public List<string> Assignees { get; set; }
    }
}
