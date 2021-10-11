using Microsoft.AspNetCore.Mvc;
using ProjectAPI.Controllers.DTO;
using ProjectAPI.Models;
using ProjectAPI.Repositories;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;

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
        public async Task<ActionResult<Project>> Create(ProjectCreateDto projectToCreate)
        {
            var project = new Project
            {
                Title = projectToCreate.Title,
                Owner = "Unknown", //TODO it should be queried from the cookie/token
                Members = new List<string>(),
                Tasks = new List<string>()
            };

            try
            {
                await _repository.Create(project);
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
        public async Task<IActionResult> UpdateTitle(ProjectUpdateTitleDto projectToUpdate)
        {
            var project = await _repository.Get(projectToUpdate.Id);

            if (project == null)
            {
                return NotFound();
            }

            project.Title = projectToUpdate.NewTitle;

            try
            {
                await _repository.Update(project);
            }
            catch (MongoWriteException e)
            {
                return BadRequest(e.Message);
            }

            return Ok();
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var project = await _repository.Get(id);

            if (project == null)
            {
                return NotFound();
            }

            await _repository.Delete(project.Id);

            return Ok();
        }
    }
}
