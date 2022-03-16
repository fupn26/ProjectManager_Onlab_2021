using Microsoft.AspNetCore.Mvc;
using ProjectAPI.Controllers.DTO;
using ProjectAPI.Models;
using ProjectAPI.Repositories;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using System;
using System.IdentityModel.Tokens.Jwt;
using RabbitMQ.Client;
using Newtonsoft.Json;
using System.Text;

namespace ProjectAPI.Controllers
{
    [Route("api/v1/project")]
    [ApiController]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectRepository _repository;

        public ProjectController(IProjectRepository repository)
        {
            _repository = repository;
        }

        [HttpPost]
        public async Task<ActionResult<Project>> Create(ProjectCreateDto projectToCreate, [FromHeader] string authorization)
        {
            if (authorization == null)
                return BadRequest("Missing authorization header!");

            string token = parseToken(authorization);
            if (token == null)
                return BadRequest("Wrong type of authorization header!");

            var jwtToken = new JwtSecurityToken(token);

            var project = new Project
            {
                Title = projectToCreate.Title,
                Owner = jwtToken.Subject,
                Members = new List<string>() {jwtToken.Subject},
                Tasks = new List<string>()
            };

            try
            {
                await _repository.Create(project);
                sendProjectUpdatedMessage(project, ProjectActivityType.CREATED);
            }
            catch (MongoWriteException e)
            {
                return BadRequest(e.Message);
            }

            return CreatedAtRoute("GetProject", new { id = project.Id.ToString() }, project);
        }

        [HttpGet("{id:length(24)}", Name = "GetProject")]
        public async Task<ActionResult<Project>> Get(string id)
        {
            var project = await _repository.Get(id);

            if (project == null)
            {
                return NotFound();
            }

            return project;
        }

        [HttpGet]
        public async Task<ActionResult<List<Project>>> Get()
        {
            var result = await _repository.Get();
            return result.ToList();
        }

        [HttpPut]
        public async Task<IActionResult> Update(ProjectUpdateDto projectToUpdate, [FromHeader] string authorization)
        {
            if (authorization == null)
                return BadRequest("Missing authorization header!");

            string token = parseToken(authorization);
            if (token == null)
                return BadRequest("Wrong type of authorization header!");

            var jwtToken = new JwtSecurityToken(token);
            
            var project = await _repository.Get(projectToUpdate.Id);

            if (project == null)
            {
                return NotFound();
            }

            if (jwtToken.Subject != project.Owner)
            {
                return Forbid("Don't hava the rights to modify!");
            }

            project.Title = projectToUpdate.Title;
            project.Members = projectToUpdate.Members;

            try
            {
                await _repository.Update(project);
                sendProjectUpdatedMessage(project, ProjectActivityType.UPDATED);
            }
            catch (MongoWriteException e)
            {
                return BadRequest(e.Message);
            }

            return Ok();
        }

        [HttpPatch("member")]
        public async Task<IActionResult> AddMember(AddMemberDto addMemberDto, [FromHeader] string authorization)
        {
            if (authorization == null)
                return BadRequest("Missing authorization header!");

            string token = parseToken(authorization);
            if (token == null)
                return BadRequest("Wrong type of authorization header!");

            var jwtToken = new JwtSecurityToken(token);

            var project = await _repository.Get(addMemberDto.ProjectId);
            if (project == null)
            {
                return NotFound();
            }

            if (jwtToken.Subject != project.Owner)
            {
                return Forbid("Don't hava the rights to modify!");
            }

            if (project.Members.Contains(addMemberDto.UserId))
            {
                return BadRequest("Given user is member of the project");
            }

            try
            {
                await _repository.AddMember(addMemberDto.ProjectId, addMemberDto.UserId);
                sendProjectUpdatedMessage(project, ProjectActivityType.MEMBER_ADDED);
            }
            catch (MongoWriteException e)
            {
                return BadRequest(e.Message);
            }

            return Ok();
        }

        [HttpDelete("member")]
        public async Task<IActionResult> DeleteMember(DeleteMemberDto deleteMemberDto, [FromHeader] string authorization)
        {
            if (authorization == null)
                return BadRequest("Missing authorization header!");

            string token = parseToken(authorization);
            if (token == null)
                return BadRequest("Wrong type of authorization header!");

            var jwtToken = new JwtSecurityToken(token);

            var project = await _repository.Get(deleteMemberDto.ProjectId);
            if (project == null)
            {
                return NotFound();
            }

            if (jwtToken.Subject != project.Owner)
            {
                return Forbid("Don't hava the rights to modify!");
            }

            if (deleteMemberDto.UserId == project.Owner)
            {
                return Forbid("Owner of the project can't be deleted from members");
            }

            try
            {
                await _repository.DeleteMember(deleteMemberDto.ProjectId, deleteMemberDto.UserId);
                sendProjectUpdatedMessage(project, ProjectActivityType.MEMBER_DELETED);
            }
            catch (MongoWriteException e)
            {
                return BadRequest(e.Message);
            }

            return Ok();
        }

        [HttpPatch("title")]
        public async Task<IActionResult> UpdateTitle(UpdateTitleDto updateTitleDto, [FromHeader] string authorization)
        {
            if (authorization == null)
                return BadRequest("Missing authorization header!");

            string token = parseToken(authorization);
            if (token == null)
                return BadRequest("Wrong type of authorization header!");

            var jwtToken = new JwtSecurityToken(token);

            var project = await _repository.Get(updateTitleDto.ProjectId);
            if (project == null)
            {
                return NotFound();
            }

            if (jwtToken.Subject != project.Owner)
            {
                return Forbid("Don't hava the rights to modify!");
            }

            try
            {
                await _repository.UpdateTitle(updateTitleDto.ProjectId, updateTitleDto.NewTitle);
                sendProjectUpdatedMessage(project, ProjectActivityType.TITLE_UPDATED);
            }
            catch (MongoWriteException e)
            {
                return BadRequest(e.Message);
            }

            return Ok();
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id, [FromHeader] string authorization)
        {
            var project = await _repository.Get(id);

            if (authorization == null)
                return BadRequest("Missing authorization header!");

            string token = parseToken(authorization);
            if (token == null)
                return BadRequest("Wrong type of authorization header!");

            var jwtToken = new JwtSecurityToken(token);

            if (project == null)
            {
                return NotFound();
            }

            if (jwtToken.Subject != project.Owner)
            {
                return Forbid("Don't have the rights to delete!");
            }

            await _repository.Delete(project.Id);

            return Ok();
        }

        private string parseToken(string authHeader)
        {
            string[] parts = authHeader.Split(null);
            if (parts.Length != 2 || parts[0] != "Bearer")
                return null;
            else
                return parts[1];
        }

        private void sendProjectUpdatedMessage(Project projectToSend, ProjectActivityType activityType)
        {
            var factory = new ConnectionFactory() { HostName = "project_rabbit", Port = 5672, UserName = "guest", Password = "guest"};
            using (var connection = factory.CreateConnection())
            using (var channel = connection.CreateModel())
            {
                channel.QueueDeclare(queue: "hello",
                                     durable: false,
                                     exclusive: false,
                                     autoDelete: false,
                                     arguments: null);

                string message = JsonConvert.SerializeObject(mapToProjectUpdatedDto(projectToSend, activityType));
                var body = Encoding.UTF8.GetBytes(message);

                IBasicProperties props = channel.CreateBasicProperties();
                props.Type = "project";
                props.ContentType = "application/json";

                channel.BasicPublish(exchange: "", 
                                     routingKey: "hello",
                                     basicProperties: props,
                                     body: body);
                Console.WriteLine(" [x] Sent {0}", message);
            }
        }

        private ProjectUpdatedDto mapToProjectUpdatedDto(Project projectToMap, ProjectActivityType activityType)
        {
            return new ProjectUpdatedDto
            {
                ProjectTitle = projectToMap.Title,
                UserId = projectToMap.Owner,
                MemberIds = projectToMap.Members,
                ActivityType = activityType
            };
        }
    }
}
