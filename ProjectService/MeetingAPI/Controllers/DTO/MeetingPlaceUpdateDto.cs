using System.ComponentModel.DataAnnotations;

namespace MeetingAPI.Controllers.DTO
{
    public class MeetingPlaceUpdateDto
    {
        [Required]
        public string Place { get; set; }
    }
}
