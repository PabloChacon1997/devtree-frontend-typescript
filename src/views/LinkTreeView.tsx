import { useEffect, useState, type ChangeEvent } from "react"
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { social } from "../data/social"
import DevTreeInput from "../components/DevTreeInput";
import { isValidUrl } from "../utils";
import { updateProfile } from "../api/DevtreeApi";
import type { SocialNetwork, User } from "../types";

export const LinkTreeView = () => {
  const [devtreeLinks, setDevtreeLinks] = useState(social);

  const queryClient = useQueryClient();
  const user: User = queryClient.getQueryData(['user'])!;

  const { mutate } = useMutation({
    mutationFn: updateProfile,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Actualizado correctamente');
    }
  })

  useEffect(() => {
    const updateLinks = devtreeLinks.map(item => {
      const userLink = JSON.parse(user.links).find((link: SocialNetwork) => link.name === item.name);
      if (userLink) {
        return {...item, url: userLink.url, enabled: userLink.enabled}
      }
      return item;
    })
    setDevtreeLinks(updateLinks);
    queryClient.setQueryData(['user'], (prevState: User) => {
      return {
        ...prevState,
        links: JSON.stringify(updateLinks),
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const updatedLinks = devtreeLinks.map(link => link.name === e.target.name ? { ...link, url: e.target.value } :link);
    setDevtreeLinks(updatedLinks);
    queryClient.setQueryData(['user'], (prevState: User) => {
      return {
        ...prevState,
        links: JSON.stringify(updatedLinks),
      }
    });
  }

  const handleEnabledLink = (socialNetwork: string) => {
    const updatedLinks = devtreeLinks.map(link => {
      if(link.name === socialNetwork) {
        if (isValidUrl(link.url)) {
          return { ...link, enabled: !link.enabled }
        } else {
          toast.error('La URL es inválida')
        }
      }
      return link;
    });
    setDevtreeLinks(updatedLinks);
    queryClient.setQueryData(['user'], (prevState: User) => {
      return {
        ...prevState,
        links: JSON.stringify(updatedLinks),
      }
    });
  }

  return (
    <div className="space-y-5">
      {
        devtreeLinks.map(item => (
          <DevTreeInput 
            key={item.name}
            item={item}
            handleUrlChange={handleUrlChange}
            handleEnabledLink={handleEnabledLink}
          />
        ))
      }
      <button 
        className="bg-cyan-400 p-2 text-lg w-full uppercase text-slate-600 rounded-lg font-bold"
        onClick={() => mutate(user)}
      >
        Guardar cambios
      </button>
    </div>
  )
}
