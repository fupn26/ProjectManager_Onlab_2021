using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAPI.Controllers.DTO
{
    public class ProjectUpdatedDto
    {
        public string ProjectTitle { get; set; }
        public string UserId { get; set; }
        public List<String> MemberIds { get; set; }
        public ProjectActivityType ActivityType { get; set; }
    }
}
