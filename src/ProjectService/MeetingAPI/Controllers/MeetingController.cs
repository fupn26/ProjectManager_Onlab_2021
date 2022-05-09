using MeetingAPI.Controllers.DTO;
using MeetingAPI.Models;
using MeetingAPI.Repositories;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MeetingAPI.Controllers
{
    [Route("api/v1/meeting")]
    [ApiController]
    public class MeetingController : ControllerBase
    {
        private readonly IMeetingRepository _repository;
        private const string _invalidCreateResponse = "StartTime should be before EndTime!";

        public MeetingController(IMeetingRepository repository)
        {
            _repository = repository;
        }

        [HttpPost]
        public async Task<ActionResult<Meeting>> Create(MeetingCreateDto meetingToCreate)
        {
            if (!meetingToCreate.IsValid())
                return BadRequest(_invalidCreateResponse);

            var meeting = MeetingCreateDtoToModel(meetingToCreate);

            try
            {
                await _repository.Create(meeting);
            }
            catch (MongoWriteException e)
            {
                return BadRequest(e.Message);
            }

            return CreatedAtRoute("GetMeeting", new { id = meeting.Id.ToString() }, meeting);
        }

        [HttpGet("{id:length(24)}", Name = "GetMeeting")]
        public async Task<ActionResult<Meeting>> Get(string id)
        {
            var meeting = await _repository.Get(id);

            if (meeting == null)
            {
                return NotFound();
            }

            return meeting;
        }

        [HttpGet]
        public async Task<ActionResult<List<Meeting>>> Get()
        {
            var result = await _repository.Get();
            return result.ToList();
        }

        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> UpdateMeeting(string id, MeetingUpdateDto newMeetingValues)
        {
            if (!newMeetingValues.IsValid())
            {
                return BadRequest(_invalidCreateResponse);
            }

            var meeting = await _repository.Get(id);

            if (meeting == null)
            {
                return NotFound();
            }

            UpdateMeetingValues(meeting, newMeetingValues);

            try
            {
                await _repository.Update(meeting);
            }
            catch (MongoWriteException e)
            {
                return BadRequest(e.Message);
            }

            return Ok();
        }

        [HttpPatch("{id:length(24)}/theme")]
        public async Task<IActionResult> UpdateMeetingTheme(string id, MeetingThemeUpdateDto newTheme)
        {
            try
            {
                var result = await _repository.UpdateTheme(id, newTheme.Theme);

                if (result.IsAcknowledged && result.ModifiedCount == 1)
                {
                    return Ok();
                }
                else
                    return NotFound();
            }
            catch (MongoWriteException e)
            {
                return BadRequest(e.Message);
            }

        }

        [HttpPatch("{id:length(24)}/date")]
        public async Task<IActionResult> UpdateMeetingDate(string id, MeetingDateUpdateDto newDate)
        {
            if (!newDate.IsValid())
            {
                return BadRequest(_invalidCreateResponse);
            }

            var result = await _repository.UpdateDate(id, newDate.StartTime, newDate.EndTime);

            if (result.IsAcknowledged && result.ModifiedCount == 1)
            {
                return Ok();
            }
            else
                return NotFound();
        }

        [HttpPatch("{id:length(24)}/place")]
        public async Task<IActionResult> UpdateMeetingPlace(string id, MeetingPlaceUpdateDto newPlace)
        {
            var result = await _repository.UpdatePlace(id, newPlace.Place);

            if (result.IsAcknowledged && result.ModifiedCount == 1)
            {
                return Ok();
            }
            else
                return NotFound();
        }

        [HttpPatch("{id:length(24)}/notes")]
        public async Task<IActionResult> UpdateMeetingNotes(string id, MeetingNotesUpdateDto newNotes)
        {
            var result = await _repository.UpdateNotes(id, newNotes.Notes);

            if (result.IsAcknowledged && result.ModifiedCount == 1)
            {
                return Ok();
            }
            else
                return NotFound();

        }

        [HttpPatch("{id:length(24)}/participants")]
        public async Task<IActionResult> UpdateMeetingParticipants(string id, MeetingParticipantsUpateDto newParticipants)
        {
            var result = await _repository.UpdateParticipants(id, newParticipants.Participants);

            if (result.IsAcknowledged && result.ModifiedCount == 1)
            {
                return Ok();
            }
            else
                return NotFound();

        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var meeting = await _repository.Get(id);

            if (meeting == null)
            {
                return NotFound();
            }

            await _repository.Delete(meeting.Id);

            return Ok();
        }

        private void UpdateMeetingValues (Meeting meetingToUpdate, MeetingUpdateDto newMeetingValues)
        {
            meetingToUpdate.Theme = newMeetingValues.Theme;
            meetingToUpdate.StartTime = newMeetingValues.StartTime;
            meetingToUpdate.EndTime = newMeetingValues.EndTime;
            meetingToUpdate.Place = newMeetingValues.Place;
            meetingToUpdate.Notes = newMeetingValues.Notes ?? meetingToUpdate.Notes;
            meetingToUpdate.Participants = newMeetingValues.Participants ?? meetingToUpdate.Participants;
        }

        private Meeting MeetingCreateDtoToModel(MeetingCreateDto meetingCreateDto)
        {
            return new Meeting
            {
                ProjectId = meetingCreateDto.ProjectId,
                CreatorId = "Unknown", // TODO get this from JWT token
                Theme = meetingCreateDto.Theme,
                StartTime = meetingCreateDto.StartTime,
                EndTime = meetingCreateDto.EndTime,
                Place = meetingCreateDto.Place,
                Notes = meetingCreateDto.Notes ?? "",
                Participants = meetingCreateDto.Participants ?? new List<string>()
            };
        }
    }
}
