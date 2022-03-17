using MessagePublisher.DTO;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAPI.Controllers.DTO
{
    public class ProjectUpdatedDto : IMessage
    {
        public string ProjectTitle { get; set; }
        public string UserId { get; set; }
        public List<String> MemberIds { get; set; }
        public ProjectActivityType ActivityType { get; set; }

        public string toJson()
        {
            return JsonConvert.SerializeObject(this);
        }
    }
}
