using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;


namespace MeetingAPI.Controllers.DTO
{
    public class MeetingUpdateDto
    {
        [Required]
        public string Theme { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Required]
        public string Place { get; set; }

        public string Notes { get; set; }

        public List<string> Participants { get; set; }

        public bool IsValid()
        {
            return StartTime < EndTime;
        }
    }
}
