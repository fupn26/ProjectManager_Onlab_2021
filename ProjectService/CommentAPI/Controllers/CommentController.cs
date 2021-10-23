using CommentAPI.Controllers.DTO;
using CommentAPI.Models;
using CommentAPI.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CommentAPI.Controllers
{
    [Route("api/v1/comment")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly ICommentRepository _repository;

        public CommentController(ICommentRepository repository)
        {
            _repository = repository;
        }

        [HttpPost]
        public async Task<ActionResult<Comment>> Create(CommentCreateDto commentToCreate)
        {
            var comment = new Comment
            {
                ToDoId = commentToCreate.ToDoId,
                Content = commentToCreate.Content,
                User = "Unknown" // TODO get user id from token
            };

            try
            {
                await _repository.Create(comment);
            }
            catch (MongoWriteException e)
            {
                return BadRequest(e.Message);
            }

            return CreatedAtRoute("GetComment", new { id = comment.Id.ToString() }, comment);
        }

        [HttpGet("{id:length(24)}", Name = "GetComment")]
        public async Task<ActionResult<Comment>> Get(string id)
        {
            var comment = await _repository.Get(id);

            if (comment == null)
            {
                return NotFound();
            }

            return comment;
        }

        [HttpGet]
        public async Task<ActionResult<List<Comment>>> Get()
        {
            var result = await _repository.Get();
            return result.ToList();
        }

        [HttpPut]
        public async Task<IActionResult> UpdateContent(CommentUpdateDto commentToUpdate)
        {
            var comment = await _repository.Get(commentToUpdate.CommentId);

            if (comment == null)
            {
                return NotFound("Comment with " + commentToUpdate.CommentId + " not found");
            }

            comment.Content = commentToUpdate.newContent;
            await _repository.Update(comment);

            return Ok();
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var comment = await _repository.Get(id);

            if (comment == null)
            {
                return NotFound("Comment with " + id + " not found");
            }

            await _repository.Delete(id);

            return Ok();
        }

    }
}
