using CommentAPI.Controllers.DTO;
using CommentAPI.Models;
using CommentAPI.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
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
        public async Task<ActionResult<Comment>> Create(CommentCreateDto commentToCreate, [FromHeader] string authorization)
        {
            if (authorization == null)
                return BadRequest("Missing authorization header!");

            string token = ParseToken(authorization);
            if (token == null)
                return BadRequest("Wrong type of authorization header!");

            var jwtToken = new JwtSecurityToken(token);

            var comment = new Comment
            {
                ToDoId = commentToCreate.ToDoId,
                Content = commentToCreate.Content,
                User = jwtToken.Subject,
                CreationTime = DateTime.Now
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
        public async Task<IActionResult> UpdateContent(CommentUpdateDto commentToUpdate, [FromHeader] string authorization)
        {
            if (authorization == null)
                return BadRequest("Missing authorization header!");

            string token = ParseToken(authorization);
            if (token == null)
                return BadRequest("Wrong type of authorization header!");

            var jwtToken = new JwtSecurityToken(token);

            var comment = await _repository.Get(commentToUpdate.CommentId);

            if (comment == null)
            {
                return NotFound("Comment with " + commentToUpdate.CommentId + " not found");
            }

            if (jwtToken.Subject != comment.User)
                return Unauthorized("Can't modify other user's comments");

            comment.Content = commentToUpdate.newContent;
            await _repository.Update(comment);

            return Ok();
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id, [FromHeader] string authorization)
        {
            if (authorization == null)
                return BadRequest("Missing authorization header!");

            string token = ParseToken(authorization);
            if (token == null)
                return BadRequest("Wrong type of authorization header!");

            var jwtToken = new JwtSecurityToken(token);

            var comment = await _repository.Get(id);

            if (comment == null)
            {
                return NotFound("Comment with " + id + " not found");
            }

            if (jwtToken.Subject != comment.User)
                return Unauthorized("Can't modify other user's comments");

            await _repository.Delete(id);

            return Ok();
        }

        private string ParseToken(string authHeader)
        {
            string[] parts = authHeader.Split(null);
            if (parts.Length != 2 || parts[0] != "Bearer")
                return null;
            else
                return parts[1];
        }
    }
}
