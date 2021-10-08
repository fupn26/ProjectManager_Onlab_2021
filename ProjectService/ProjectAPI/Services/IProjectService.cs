using ProjectAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAPI.Services
{
    public interface IProjectService
    {
        void Create(Project projectToCreate);
        Project Get(string projectId);
    }
}
