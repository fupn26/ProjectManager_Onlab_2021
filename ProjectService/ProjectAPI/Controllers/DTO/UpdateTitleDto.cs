using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAPI.Controllers.DTO
{
    public class UpdateTitleDto
    {
        [Required]
        public string ProjectId { get; set; }
        [Required]
        public string NewTitle { get; set; }
    }
}
