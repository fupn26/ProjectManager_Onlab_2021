using ProjectAPI.WebServices.DTO;
using Refit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAPI.WebServices
{
    public interface IUserApi
    {
        [Get("/api/v1/user/{id}")]
        Task<UserDto> GetUser(string id);
    }
}
