using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAPI.Controllers.DTO
{
    public class ProjectCreateDto
    {
        [Required]
        public string Title { get; set; }
    }
}
