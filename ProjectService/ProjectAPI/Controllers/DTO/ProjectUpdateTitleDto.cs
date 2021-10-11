using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAPI.Controllers.DTO
{
    public class ProjectUpdateTitleDto
    {
        [Required]
        public string Id { get; set; }
        [Required]
        public string NewTitle { get; set; }
    }
}
