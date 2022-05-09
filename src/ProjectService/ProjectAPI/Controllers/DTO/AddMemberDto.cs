using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAPI.Controllers.DTO
{
    public class AddMemberDto
    {
        [Required]
        public string ProjectId { get; set; }
        [Required]
        public string UserId { get; set; }
    }
}
