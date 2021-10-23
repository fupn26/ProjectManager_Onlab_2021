using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MeetingAPI.Controllers.DTO
{
    public class MeetingCreateDto : MeetingUpdateDto
    {
        [Required]
        public string ProjectId { get; set; }
    }
}
