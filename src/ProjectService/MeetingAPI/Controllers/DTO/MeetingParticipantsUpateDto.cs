using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MeetingAPI.Controllers.DTO
{
    public class MeetingParticipantsUpateDto
    {
        [Required]
        public List<string> Participants { get; set; }
    }
}
